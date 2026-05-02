using Pdv.Api.Models;

namespace Pdv.Api.Data;

public static class FakeDatabase
{
    public static List<Produto> Produtos { get; } = new();
    public static List<Venda> Vendas { get; } = new();
    public static List<EstoqueMovimentacao> Movimentacoes { get; } = new();

    private static int _produtoId = 1;
    private static int _vendaId = 1;
    private static int _movId = 1;

    public static int NextProdutoId() => _produtoId++;
    public static int NextVendaId() => _vendaId++;
    public static int NextMovId() => _movId++;
}
