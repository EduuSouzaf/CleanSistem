using Microsoft.EntityFrameworkCore;
using Pdv.Api.Models;

namespace Pdv.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Venda> Vendas => Set<Venda>();
    public DbSet<EstoqueMovimentacao> Movimentacoes => Set<EstoqueMovimentacao>();
    public DbSet<Devolucao> Devolucoes => Set<Devolucao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Venda>()
            .HasMany(v => v.Itens)
            .WithOne()
            .HasForeignKey(i => i.VendaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VendaItem>()
            .Ignore(i => i.Subtotal)
            .Ignore(i => i.Lucro);

        modelBuilder.Entity<Devolucao>()
            .HasMany(d => d.Itens)
            .WithOne()
            .HasForeignKey(i => i.DevolucaoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
