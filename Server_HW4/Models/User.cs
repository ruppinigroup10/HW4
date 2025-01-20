namespace Server.Models
{
    public class User
    {
        private int ID;
        private string Name;
        private string Email;
        private string Password;
        private static List<User> UsersList = new List<User>();



        public int id { get => ID; set => ID = value; }
        public string name { get => Name; set => Name = value; }
        public string email { get => Email; set => Email = value; }
        public string password { get => Password; set => Password = value; }

        public User()
        {
            this.ID = 0;
            this.Name = "";
            this.Email = "";
            this.Password = "";
        }
        public User(int ID, string Name, string Email, string Password)
        {
            this.ID = ID;
            this.Name = Name;
            this.Email = Email;
            this.Password = Password;
        }

        public Boolean insertUser()
        {
            if (UsersList.Exists(x => x.ID == this.ID))
            {
                return false;
            }
            else
            {
                UsersList.Add(this);
                return true;
            }
        }
        public static List<User> readUser()
        {
            return UsersList;
        }

        //User? is a nullable type, it can be either User or null
        public static User? Register(string name, string email, string password)
        {
            DBservices dbs = new DBservices();
            return dbs.RegisterUser(name, email, password);
        }
        public static User? Login(string email, string password)
        {
            DBservices dbs = new DBservices();
            return dbs.LoginUser(email, password);
        }

        public static User? UpdateProfile(int id, string name, string email, string password)
        {
            DBservices dbs = new DBservices();
            return dbs.UpdateUserInfo(id, name, email, password);
        }

    }
}
