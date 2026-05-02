namespace Pdv.Api.Models;

public class Venda
{
    public int Id { get; set; }
    public string TipoPagamento { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public DateTime Data { get; set; }
    public List<VendaItem> Itens { get; set; } = new();
}
