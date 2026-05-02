namespace Pdv.Api.Models;

public class Devolucao
{
    public int Id { get; set; }
    public int VendaId { get; set; }
    public DateTime Data { get; set; }
    public List<DevolucaoItem> Itens { get; set; } = new();
}

public class DevolucaoItem
{
    public int Id { get; set; }
    public int DevolucaoId { get; set; }
    public int ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}
