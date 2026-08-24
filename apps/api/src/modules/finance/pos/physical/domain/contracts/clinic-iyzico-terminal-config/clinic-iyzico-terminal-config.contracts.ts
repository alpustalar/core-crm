/**
 * ClinicIyzicoTerminalConfig domain kontratları. Entity static `create()` girişi (Props).
 */
export interface CreateClinicIyzicoTerminalConfigProps {
  id?: string;
  clinicId: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}
