namespace Pdv.Api.DTOs;

public class AtualizarProdutoRequest
{
    public string Nome { get; set; } = string.Empty;
    public string CodigoBarras { get; set; } = string.Empty;
    public decimal PrecoCusto { get; set; }
    public decimal PrecoVenda { get; set; }
}
