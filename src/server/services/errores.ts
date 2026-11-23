/** Error esperado de una regla de negocio. La capa API lo traduce a un código HTTP. */
export class ErrorDeNegocio extends Error {
  constructor(mensaje: string, public readonly status = 400) {
    super(mensaje);
    this.name = "ErrorDeNegocio";
  }
}
