namespace Pdv.Api.DTOs;

public class EntradaEstoqueRequest
{
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoCusto { get; set; }
    public string? LocalCompra { get; set; }
}
