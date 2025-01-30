using System.Text;
using System.Text.Json;

namespace Server_HW4.Models
{
    public class GenreClassifier
    {
        private readonly string _apiKey; // Your HuggingFace API key
        private readonly HttpClient _client;
        private const string API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

        public GenreClassifier(string apiKey)
        {
            _apiKey = apiKey;
            _client = new HttpClient();
            _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        }

        // Method to classify game genre based on description
        public async Task<string> ClassifyGenre(string gameDescription)
        {
            try
            {
                // Define possible game genres
                var genres = new[] { "Action", "Adventure", "RPG", "Strategy", "Sports", "Simulation" };

                // Format request for zero-shot classification
                var requestData = new
                {
                    inputs = gameDescription,
                    parameters = new
                    {
                        candidate_labels = genres
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(requestData),
                    Encoding.UTF8,
                    "application/json"
                );

                // Make the API call
                var response = await _client.PostAsync(API_URL, content);
                response.EnsureSuccessStatusCode();

                // Parse the response
                var result = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"API Response: {result}"); // Debug log

                // Parse response and get the most likely genre
                var classification = JsonSerializer.Deserialize<ZeroShotResponse>(result) ?? new ZeroShotResponse();
                var topGenre = classification.labels[0]; // Get the highest scoring genre

                return topGenre;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error classifying genre: {ex.Message}");
                return "Unknown";
            }
        }
    }
}