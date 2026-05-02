using Fido2NetLib;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pdv.Api.Data;
using Pdv.Api.Services;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

var connStr = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Variável DATABASE_URL não configurada.");

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connStr));

// ── Serviços de negócio ──────────────────────────────────────────────────────
builder.Services.AddScoped<ProdutoService>();
builder.Services.AddScoped<VendaService>();
builder.Services.AddScoped<DevolucaoService>();
builder.Services.AddScoped<EstoqueService>();
builder.Services.AddScoped<RelatorioService>();

// ── Auth ─────────────────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddSingleton<WebAuthnChallengeStore>();
builder.Services.AddScoped<WebAuthnService>();

// ── Fido2 / WebAuthn ─────────────────────────────────────────────────────────
builder.Services.AddSingleton<IFido2>(_ =>
{
    var cfg = builder.Configuration;
    var origins = cfg.GetSection("WebAuthn:Origins").Get<string[]>()
                  ?? ["http://localhost:5173"];

    return new Fido2NetLib.Fido2(new Fido2Configuration
    {
        ServerDomain = cfg["WebAuthn:RpId"] ?? "localhost",
        ServerName   = "PDV CleanSistemas",
        Origins      = new HashSet<string>(origins),
        TimestampDriftTolerance = 300_000,
    });
});

// ── JWT ───────────────────────────────────────────────────────────────────────
var jwtKey      = builder.Configuration["Jwt:Key"]       ?? throw new InvalidOperationException("Jwt:Key não configurada.");
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]    ?? "pdv-api";
var jwtAudience = builder.Configuration["Jwt:Audience"]  ?? "pdv-client";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(opt =>
    {
        opt.InvalidModelStateResponseFactory = ctx =>
        {
            var msg = ctx.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m))
                ?? "Dados inválidos na requisição.";
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { message = msg });
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://clean-sistem.vercel.app",
                "https://cleansistem.vercel.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
    var msg = feature?.Error?.Message ?? "Erro interno do servidor.";
    await ctx.Response.WriteAsJsonAsync(new { message = msg });
}));

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/v1/health", () => Results.Ok(new { status = "ok" }));

app.Run();
