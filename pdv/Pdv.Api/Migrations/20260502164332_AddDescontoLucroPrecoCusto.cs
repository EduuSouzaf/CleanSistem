using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pdv.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDescontoLucroPrecoCusto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Desconto",
                table: "Vendas",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Lucro",
                table: "Vendas",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Vendas",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecoCusto",
                table: "VendaItem",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Desconto",
                table: "Vendas");

            migrationBuilder.DropColumn(
                name: "Lucro",
                table: "Vendas");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Vendas");

            migrationBuilder.DropColumn(
                name: "PrecoCusto",
                table: "VendaItem");
        }
    }
}
