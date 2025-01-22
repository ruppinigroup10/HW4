using Server_HW4.Models;

namespace Server_HW4.Models
{
    public class GameUser
    {
        public Game game { get; set; }
        public User user { get; set; }
        public GameUser()
        {
            this.game = new Game();
            this.user = new User();
        }

        public GameUser(Game game, User user)
        {
            this.game = game;
            this.user = user;
        }
        
        public void hey()
        {
            var hey = 0;
        }
    }
}
