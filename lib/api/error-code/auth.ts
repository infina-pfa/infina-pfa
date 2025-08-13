/**
 * Authentication Error Codes
 * Maps error identifiers to Supabase error codes
 */

export enum AUTH_ERROR_CODES {
  // Sign In Errors
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  USER_BANNED = 'user_banned',
  
  // Sign Up Errors  
  EMAIL_EXISTS = 'email_exists',
  PHONE_EXISTS = 'phone_exists',
  SIGNUP_DISABLED = 'signup_disabled',
  
  // Session & Token Errors
  SESSION_NOT_FOUND = 'session_not_found',
  SESSION_EXPIRED = 'session_expired',
  REFRESH_TOKEN_NOT_FOUND = 'refresh_token_not_found',
  REFRESH_TOKEN_ALREADY_USED = 'refresh_token_already_used',
  BAD_JWT = 'bad_jwt',
  NOT_ADMIN = 'not_admin',
  NO_AUTHORIZATION = 'no_authorization',
  
  // OAuth Errors
  BAD_OAUTH_STATE = 'bad_oauth_state',
  BAD_OAUTH_CALLBACK = 'bad_oauth_callback',
  OAUTH_PROVIDER_NOT_SUPPORTED = 'oauth_provider_not_supported',
  
  // MFA Errors
  MFA_FACTOR_NOT_FOUND = 'mfa_factor_not_found',
  MFA_CHALLENGE_EXPIRED = 'mfa_challenge_expired',
  MFA_VERIFICATION_FAILED = 'mfa_verification_failed',
  MFA_VERIFICATION_REJECTED = 'mfa_verification_rejected',
  TOO_MANY_ENROLLED_MFA_FACTORS = 'too_many_enrolled_mfa_factors',
  MFA_FACTOR_NAME_CONFLICT = 'mfa_factor_name_conflict',
  MFA_IP_ADDRESS_MISMATCH = 'mfa_ip_address_mismatch',
  INSUFFICIENT_AAL = 'insufficient_aal',
  
  // Email/Phone Verification
  PHONE_NOT_CONFIRMED = 'phone_not_confirmed',
  EMAIL_PROVIDER_DISABLED = 'email_provider_disabled',
  PHONE_PROVIDER_DISABLED = 'phone_provider_disabled',
  PROVIDER_EMAIL_NEEDS_VERIFICATION = 'provider_email_needs_verification',
  
  // Other Errors
  INVITE_NOT_FOUND = 'invite_not_found',
  FLOW_STATE_NOT_FOUND = 'flow_state_not_found',
  FLOW_STATE_EXPIRED = 'flow_state_expired',
  UNEXPECTED_AUDIENCE = 'unexpected_audience',
  SINGLE_IDENTITY_NOT_DELETABLE = 'single_identity_not_deletable',
  EMAIL_CONFLICT_IDENTITY_NOT_DELETABLE = 'email_conflict_identity_not_deletable',
  IDENTITY_ALREADY_EXISTS = 'identity_already_exists',
  CAPTCHA_FAILED = 'captcha_failed',
  SAML_PROVIDER_DISABLED = 'saml_provider_disabled',
  MANUAL_LINKING_DISABLED = 'manual_linking_disabled',
  SMS_SEND_FAILED = 'sms_send_failed',
  REAUTH_NONCE_MISSING = 'reauth_nonce_missing',
  SAML_RELAY_STATE_NOT_FOUND = 'saml_relay_state_not_found',
  
  // Generic Errors
  UNEXPECTED_FAILURE = 'unexpected_failure',
  VALIDATION_FAILED = 'validation_failed',
  BAD_JSON = 'bad_json',
}