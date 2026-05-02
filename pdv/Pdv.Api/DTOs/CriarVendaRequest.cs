namespace Pdv.Api.DTOs;

public class CriarVendaRequest
{
    public string TipoPagamento { get; set; } = string.Empty;
    public decimal Desconto { get; set; }
    public List<VendaItemRequest> Itens { get; set; } = new();
}

public class VendaItemRequest
{
    public int? ProdutoId { get; set; }
    public string? CodigoBarras { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}
