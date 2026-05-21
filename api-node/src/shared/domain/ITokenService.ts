export interface ITokenService {
  gerarToken(payload: object, expiresIn: string | number): string;
  verificarToken(token: string): any | null;
}
