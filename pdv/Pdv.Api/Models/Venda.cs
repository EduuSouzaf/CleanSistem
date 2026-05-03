namespace Pdv.Api.Models;

public class Venda
{
    public int Id { get; set; }
    public string TipoPagamento { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Desconto { get; set; }
    public decimal Total { get; set; }
    public decimal Lucro { get; set; }
    public DateTime Data { get; set; }
    public List<VendaItem> Itens { get; set; } = new();
}
