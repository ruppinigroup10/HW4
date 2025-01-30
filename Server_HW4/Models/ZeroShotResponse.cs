namespace Server_HW4.Models
{
    public class ZeroShotResponse
    {
        public string[] labels { get; set; }
        public double[] scores { get; set; }
        public string sequence { get; set; }

        public ZeroShotResponse()
        {
            this.labels = new string[0];
            this.scores = new double[0];
            this.sequence = string.Empty;
        }

        public ZeroShotResponse(string[] labels, double[] scores, string sequence)
        {
            this.labels = labels;
            this.scores = scores;
            this.sequence = sequence;
        }
    }
}
