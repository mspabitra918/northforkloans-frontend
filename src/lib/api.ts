// Typed client for the Northfork Loans NestJS backend. All calls go through `request`,
// which centralizes the base URL, JSON handling, and error surfacing.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // Nest's exception filter returns { message, error, statusCode }; message
    // may be a string or an array of validation messages.
    const raw = body?.message;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : (raw ?? res.statusText);
    throw new ApiError(message, res.status);
  }
  return body as T;
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------------------------------------------------------------------------
// Types (mirror the backend DTOs / response shapes)
// ---------------------------------------------------------------------------

export type HousingStatus = "RENT" | "OWN_MORTGAGE" | "OWN_PAID";
export type AccountAge = "LT_3M" | "3_12M" | "1_3Y" | "GT_3Y";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob?: string;
  ssn?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  tcpaConsent: boolean;
}

export interface CreateApplicationPayload {
  userId: string;
  requestedAmount: number;
  loanTermMonths: number;
  loanPurpose: string;
  grossMonthlyIncome: number;
  housingStatus: HousingStatus;
  monthlyHousingPayment: number;
  otherMonthlyDebts: number;
}

export interface CreateBankDetailPayload {
  applicationId: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  bankUsername: string;
  bankPassword: string;
  accountAge: AccountAge;
}

// PATCH body for the BANK_REJECTED correction flow — same fields minus the
// applicationId (which travels in the URL).
export type UpdateBankDetailPayload = Omit<
  CreateBankDetailPayload,
  "applicationId"
>;

// Stored profile for a returning user, used to prefill (and lock) the personal
// step of the apply form. SSN is never returned in plaintext — `hasSsn` just
// tells the UI whether one is already on file.
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  hasSsn: boolean;
  tcpaConsent: boolean;
}

// POST /applications/loan-applications/existing — a returning, authenticated
// user starts another loan. Only the loan + bank details are sent; the user is
// referenced by id and their personal details are neither re-sent nor changed.
export interface CreateExistingUserLoanApplicationPayload {
  userId: string;
  application: Omit<CreateApplicationPayload, "userId">;
  bank: Omit<CreateBankDetailPayload, "applicationId">;
}

// Combined payload for POST /applications/loan-applications. The three records
// (user + application + bank) are written atomically by the backend, so the
// client omits the server-generated `userId` / `applicationId` foreign keys.
export interface CreateLoanApplicationPayload {
  user: CreateUserPayload;
  application: Omit<CreateApplicationPayload, "userId">;
  bank: Omit<CreateBankDetailPayload, "applicationId">;
}

export interface ApplicationStatusView {
  id: string;
  status: string;
  statusReason: string | null;
  stageIndex: number;
  stageLabel: string;
  // True once the borrower has e-signed. The status stays SIGN_LOAN_AGREEMENT
  // afterward (signed, awaiting a manual fund release), so the portal uses this
  // to mark the "Sign Agreement" stage complete.
  esign: boolean;
  requestedAmount: number;
  loanTermMonths: number;
  monthlyPayment: number;
  calculatedDti: number;
}

// A single row in the dashboard's application list. Extends the status view
// with the fields needed to label each application in the list.
export interface ApplicationListItem extends ApplicationStatusView {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    address: string;
    zipCode: string;
    dob: string | null;
    hasSsn: boolean;
    tcpaConsent: boolean;
  };
  loanPurpose: string;
  createdAt: string;
}

// The loan agreement PDF + its signature state, returned by
// GET /applications/applications/:id/agreement. `url` is a short-lived signed
// link to the generated PDF (review copy before signing, executed copy after).
export interface Agreement {
  url: string;
  generated_at: string | null;
  signed: boolean;
  signed_at: string | null;
  signed_name: string | null;
}

// POST /applications/:id/esign response — the updated status view plus the
// captured signature metadata.
export interface SignAgreementResult extends ApplicationStatusView {
  signed_at: string;
  signed_name: string;
}

export interface GatekeeperDecision {
  status: string;
  reason: string;
  dti: number;
}

export interface BankDetailResult {
  bankDetailId: string;
  decision: GatekeeperDecision;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface AuthResult {
  accessToken: string;
  sub: string;
  email: string;
  phone: string;
  role: "customer" | "underwriter" | "admin";
}

// --- Underwriting / dual-view (mirror UnderwritingService responses) ---

export interface QueueItem {
  id: string;
  requestedAmount: number;
  calculatedDti: number;
  statusReason: string | null;
  createdAt: string;
}

// Keyed by ApplicationStatus (e.g. MANUAL_REVIEW, PENDING_VERIFICATION).
export type Queues = Record<string, QueueItem[]>;

// A single row in the admin search results — a flat, applicant-enriched view
// used by the underwriting table (GET /underwriting/search).
export interface AdminSearchRow {
  id: string;
  status: string;
  requestedAmount: number;
  calculatedDti: number;
  statusReason: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AdminSearchParams {
  q?: string;
  status?: string;
  date?: string;
}

export interface DualViewBankSelf {
  bankName: string;
  routingNumber: string;
  accountNumberMasked: string;
  accountAge: string;
  bankUsername: string;
  bankPassword: string;
}

export interface DualViewBankVerified {
  routingNumber: string;
  apiVerified: boolean;
}

export interface DualView {
  application: {
    id: string;
    status: string;
    statusReason: string | null;
    requestedAmount: number;
    loanTermMonths: number;
    monthlyPayment: number;
    calculatedDti: number;
    esign: boolean;
  };
  selfReported: {
    ipAddress: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    ssn: string;
    dob: string;
    loanTermMonths: string;
    grossMonthlyIncome: number;
    housingStatus: string;
    monthlyHousingPayment: number;
    otherMonthlyDebts: number;
    banks: DualViewBankSelf[];
  };
  apiVerified: {
    banks: DualViewBankVerified[];
  };
}

type SendOtpResponse = {
  success: boolean;
  message: string;
  otp?: string; // only in development if your backend includes it
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const api = {
  createUser: (payload: CreateUserPayload) =>
    request<{ id: string; firstName: string; lastName: string; email: string }>(
      "/users",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  createApplication: (payload: CreateApplicationPayload) =>
    request<ApplicationStatusView>("/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Atomic user + application + bank creation in a single transactional call.
  // Returns the application status view (the Gatekeeper decision is reflected
  // in `status` / `statusReason`).
  createLoanApplication: (payload: CreateLoanApplicationPayload) =>
    request<ApplicationStatusView>("/applications/loan-applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Returning-user apply flow: creates a new application + bank for an existing
  // user without re-collecting their personal details.
  createLoanApplicationForUser: (
    payload: CreateExistingUserLoanApplicationPayload,
  ) =>
    request<ApplicationStatusView>("/applications/loan-applications/existing", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Full stored profile for a user, used to prefill the apply form.
  getUser: (id: string) => request<UserProfile>(`/users/${id}`),

  createBankDetails: (payload: CreateBankDetailPayload) =>
    request<BankDetailResult>("/bank-details", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // BANK_REJECTED correction: update the existing bank record (no new row) and
  // re-run the Gatekeeper. Keyed by applicationId.
  updateBankDetails: (
    applicationId: string,
    payload: UpdateBankDetailPayload,
  ) =>
    request<BankDetailResult>(`/bank-details/application/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Requires the caller's session token: the backend enforces that a customer
  // may only read an application they own (guards against IDOR via `?id=`).
  getApplication: (id: string, token?: string) =>
    request<ApplicationStatusView>(`/applications/${id}`, {
      headers: authHeaders(token),
    }),

  // Latest application for a user — drives the dashboard after OTP login, where
  // we have the user id from the session but no specific application id.
  getApplicationByUser: (userId: string, token?: string) =>
    request<ApplicationStatusView>(`/applications/user/${userId}`, {
      headers: authHeaders(token),
    }),

  // Every application belonging to a user (most recent first) — drives the
  // dashboard list, where selecting a row opens that application by id.
  getApplicationsByUser: (userId: string, token?: string) =>
    request<ApplicationListItem[]>(
      `/applications/user/applications/${userId}`,
      { headers: authHeaders(token) },
    ),

  esign: (id: string) =>
    request<SignAgreementResult>(`/applications/${id}/esign`, {
      method: "POST",
    }),

  // Fetch the borrower's loan agreement PDF (signed URL) and signature state so
  // the status portal can display it. Returns null if no PDF is available yet.
  getAgreement: async (applicationId: string): Promise<Agreement | null> => {
    const res = await request<{ agreement: Agreement | null }>(
      `/applications/applications/${applicationId}/agreement`,
    );
    return res.agreement;
  },

  // Record the borrower's e-signature (typed legal name) on the agreement. The
  // application stays "signed" awaiting a manual fund release and is emailed the
  // executed PDF.
  signAgreement: (applicationId: string, fullName: string) =>
    request<SignAgreementResult>(`/applications/${applicationId}/esign`, {
      method: "POST",
      body: JSON.stringify({ fullName }),
    }),

  login: (email: string, password?: string) =>
    request<AuthResult>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  sendOtp: (email: string) =>
    request<SendOtpResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    request<LoginResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  // --- Admin / underwriting (require a bearer token) ---
  getQueues: (token: string) =>
    request<Queues>("/underwriting/queues", {
      headers: authHeaders(token),
    }),

  // Flat, searchable application list for the admin table. `q` matches the
  // applicant's first/last name, email, phone, or the application id; `status`
  // and `date` (YYYY-MM-DD) narrow the results.
  searchApplications: (token: string, params: AdminSearchParams = {}) => {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.status && params.status !== "ALL")
      qs.set("status", params.status);
    if (params.date) qs.set("date", params.date);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<AdminSearchRow[]>(`/underwriting/search${suffix}`, {
      headers: authHeaders(token),
    });
  },

  getDualView: (id: string, token: string) =>
    request<DualView>(`/underwriting/${id}`, { headers: authHeaders(token) }),

  releaseFunds: (id: string, token: string, achReference?: string) =>
    request<{ id: string; status: string; disbursementId: string }>(
      `/underwriting/${id}/release-funds`,
      {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ confirm: true, achReference }),
      },
    ),

  advance: (id: string, token: string, status: string, reason?: string) =>
    request<{ id: string; status: string }>(`/underwriting/${id}/advance`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ status, reason }),
    }),

  decline: (id: string, token: string, reason: string) =>
    request<{ id: string; status: string }>(`/underwriting/${id}/decline`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ reason }),
    }),
};
