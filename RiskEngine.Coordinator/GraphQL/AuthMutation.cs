using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RiskEngine.Coordinator.Data;
using RiskEngine.Models.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RiskEngine.Coordinator.GraphQL;

public class AuthMutation
{
    public async Task<string> Register(string email, string password, [Service] AppDbContext dbContext, [Service] IConfiguration config)
    {
        if (await dbContext.Users.AnyAsync(u => u.Email == email))
            throw new GraphQLException("User already exists.");

        var user = new User
        {
            Email = email,
            PasswordHash = HashPassword(password)
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        return GenerateJwtToken(user, config);
    }

    public async Task<string> Login(string email, string password, [Service] AppDbContext dbContext, [Service] IConfiguration config)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || user.PasswordHash != HashPassword(password))
            throw new GraphQLException("Invalid credentials.");

        return GenerateJwtToken(user, config);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private string GenerateJwtToken(User user, IConfiguration config)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? "VeryLongSecretStringForTestingBecauseThisIsPrototype"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
