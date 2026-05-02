namespace Pdv.Api.DTOs;

public class DevolucaoRequest
{
    public List<DevolucaoItemRequest> Itens { get; set; } = new();
}

public class DevolucaoItemRequest
{
    public int ProdutoId { get; set; }
    public int Quantidade { get; set; }
}
