namespace Pdv.Api.Models;

public class EstoqueMovimentacao
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // "Entrada" ou "Saida"
    public int Quantidade { get; set; }
    public decimal PrecoCusto { get; set; }
    public DateTime Data { get; set; }
}
