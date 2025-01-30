using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Text;
using Server_HW4.Models;

/// <summary>
/// DBServices is a class created by me to provides some DataBase Services
/// </summary>
public class DBservices
{


    public DBservices()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    //--------------------------------------------------------------------------------------------------
    // This method creates a connection to the database according to the connectionString name in the web.config 
    //--------------------------------------------------------------------------------------------------
    public SqlConnection connect(String conString)
    {

        // read the connection string from the configuration file
        IConfigurationRoot configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        SqlConnection con = new SqlConnection(cStr);
        con.Open();
        return con;
    }

    //--------------------------------------------------------------------------------------------------
    // This method insert game 
    //--------------------------------------------------------------------------------------------------
    public int InsertGame(GameUser gameUser)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", gameUser.user.id);
        paramDic.Add("@AppID", gameUser.game.AppID);
        paramDic.Add("@Genre", gameUser.game.Genre ?? "Unknown");

        cmd = CreateCommandWithStoredProcedureGeneral("SP_PurchasedGame", con, paramDic);          // create the command

        try
        {
            int numEffected = cmd.ExecuteNonQuery(); // execute the command
            return numEffected;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method geting all games
    //--------------------------------------------------------------------------------------------------
    public List<Game> getAllGames()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        List<Game> gameList = new List<Game>();

        cmd = CreateCommandWithStoredProcedureGeneral("SP_ShowAllGames", con, null);

        try
        {

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Game g = new Game();
                g.AppID = Convert.ToInt32(dataReader["AppID"]);
                g.Name = dataReader["Name"].ToString() ?? "";
                g.ReleaseDate = Convert.ToDateTime(dataReader["Release_date"]);
                g.Price = Convert.ToDouble(dataReader["Price"]);
                g.Publisher = dataReader["Developers"].ToString() ?? "";
                g.HeaderImage = dataReader["Header_image"].ToString() ?? "";
                g.ScoreRank = Convert.ToInt32(dataReader["Score_rank"]);
                g.Description = dataReader["Description"]?.ToString() ?? "";
                gameList.Add(g);
            }
            return gameList;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }
        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method geting my games - per user
    //--------------------------------------------------------------------------------------------------

    public List<Game> getAllMyGames(User user)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        List<Game> gameList = new List<Game>();

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", user.id);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_ShowAllMyGames", con, paramDic);

        try
        {

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Game g = new Game();
                g.AppID = Convert.ToInt32(dataReader["AppID"]);
                g.Name = dataReader["Name"].ToString() ?? "";
                g.ReleaseDate = Convert.ToDateTime(dataReader["Release_date"]);
                g.Price = Convert.ToDouble(dataReader["Price"]);
                g.Publisher = dataReader["Developers"].ToString() ?? "";
                g.HeaderImage = dataReader["Header_image"].ToString() ?? "";
                g.ScoreRank = Convert.ToInt32(dataReader["Score_rank"]);
                gameList.Add(g);
            }
            return gameList;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }
        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }


    //--------------------------------------------------------------------------------------------------
    // This method register user
    //--------------------------------------------------------------------------------------------------
    public User? RegisterUser(string name, string email, string password)
    {
        SqlConnection con;
        SqlCommand cmd;
        User? user = null;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw new Exception("Database connection error: " + ex.Message);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Name", name);
        paramDic.Add("@Email", email);
        paramDic.Add("@Password", password);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_RegisterUser", con, paramDic);

        try
        {
            using (SqlDataReader dr = cmd.ExecuteReader())
            {
                if (dr.Read())
                {
                    user = new User
                    {
                        id = Convert.ToInt32(dr["ID"]),
                        name = dr["Name"].ToString() ?? "",
                        email = dr["Email"].ToString() ?? ""
                    };
                }
            }
            return user;
        }
        catch (SqlException ex)
        {
            if (ex.Message.Contains("Email already exists"))
            {
                throw new Exception("Email already exists");
            }
            throw new Exception("Registration failed");
        }
        finally
        {
            if (con != null && con.State == System.Data.ConnectionState.Open)
            {
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method login user
    //--------------------------------------------------------------------------------------------------
    public User? LoginUser(string email, string password)
    {
        SqlConnection con;
        SqlCommand cmd;
        User? user = null;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw new Exception("Database connection error: " + ex.Message);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@Email", email);
        paramDic.Add("@Password", password);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_LoginUser", con, paramDic);

        try
        {
            using (SqlDataReader dr = cmd.ExecuteReader())
            {
                if (dr.Read())
                {
                    //check if active
                    bool isActive = Convert.ToBoolean(dr["isActive"]);
                    if (!isActive)
                    {
                        throw new Exception("Account is not active");
                    }

                    user = new User
                    {
                        id = Convert.ToInt32(dr["ID"]),
                        name = dr["Name"].ToString() ?? "",
                        email = dr["Email"].ToString() ?? "",
                        IsActive = isActive
                    };
                }
            }
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Login failed: " + ex.Message);
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method filter by price
    //--------------------------------------------------------------------------------------------------

    public List<Game> filterMyGamesByPrice(User user, double minPrice)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception)
        {
            throw;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", user.id);
        paramDic.Add("@MinPrice", minPrice);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_FilterMyGamesByPrice", con, paramDic);

        return ExecuteGameReader(cmd, con);
    }

    //--------------------------------------------------------------------------------------------------
    // This method filter by rank
    //--------------------------------------------------------------------------------------------------

    public List<Game> filterMyGamesByRank(User user, int minRank)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception)
        {
            throw;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", user.id);
        paramDic.Add("@MinRank", minRank);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_FilterMyGamesByRank", con, paramDic);

        return ExecuteGameReader(cmd, con);
    }


    //--------------------------------------------------------------------------------------------------
    // Helper method to avoid code duplication for filterMyGamesByPrice and filterMyGamesByRank
    //--------------------------------------------------------------------------------------------------
    private List<Game> ExecuteGameReader(SqlCommand cmd, SqlConnection con)
    {
        List<Game> gameList = new List<Game>();
        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Game g = new Game();
                g.AppID = Convert.ToInt32(dataReader["AppID"]);
                g.Name = dataReader["Name"].ToString() ?? "";
                g.ReleaseDate = Convert.ToDateTime(dataReader["Release_date"]);
                g.Price = Convert.ToDouble(dataReader["Price"]);
                g.Publisher = dataReader["Developers"].ToString() ?? "";
                g.HeaderImage = dataReader["Header_image"].ToString() ?? "";
                g.ScoreRank = Convert.ToInt32(dataReader["Score_rank"]);
                gameList.Add(g);
            }
            return gameList;
        }
        catch (Exception)
        {
            throw;
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // Method to update user info from the database
    //--------------------------------------------------------------------------------------------------
    public User? UpdateUserInfo(int id, string name, string email, string password)
    {
        SqlConnection con;
        SqlCommand cmd;
        User? user = null;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw new Exception("Database connection error: " + ex.Message);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", id);
        paramDic.Add("@Name", name);
        paramDic.Add("@Email", email);
        paramDic.Add("@Password", password);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateUserInfo", con, paramDic);

        try
        {
            using (SqlDataReader dr = cmd.ExecuteReader())
            {
                if (dr.Read())
                {
                    user = new User
                    {
                        id = Convert.ToInt32(dr["ID"]),
                        name = dr["Name"].ToString() ?? "",
                        email = dr["Email"].ToString() ?? ""
                    };
                }
            }
            return user;
        }
        catch (SqlException ex)
        {
            if (ex.Message.Contains("Email already exists"))
            {
                throw new Exception("Email already exists");
            }
            throw new Exception("Update failed");
        }
        finally
        {
            if (con != null && con.State == System.Data.ConnectionState.Open)
            {
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // Method to update user isActive
    //--------------------------------------------------------------------------------------------------
    public int UpdateUserIsActive(int id, int isActive)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB");
        }
        catch (Exception ex)
        {
            throw new Exception("Database connection error: " + ex.Message);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", id);
        paramDic.Add("@isActive", isActive);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateActive", con, paramDic);

        try
        {
            int numEffected = cmd.ExecuteNonQuery(); // execute the command
            return numEffected;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method geting all users purchases
    //--------------------------------------------------------------------------------------------------
    public Object readUsersData()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        List<Object> listObjs = new List<Object>();

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetUsersData", con, null);

        try
        {

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {

                listObjs.Add(new
                {
                    ID = Convert.ToInt32(dataReader["ID"]),
                    Name = dataReader["Name"].ToString() ?? "",
                    numOfGamesBought = Convert.ToInt32(dataReader["numOfGamesBought"]),
                    amountSpent = Convert.ToDouble(dataReader["amountSpent"]),
                    isActive = Convert.ToBoolean(dataReader["isActive"])
                });
            }
            return listObjs;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }
        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method geting all games purchases
    //--------------------------------------------------------------------------------------------------
    public Object readGamesData()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        List<Object> listObjs = new List<Object>();

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetGamesData", con, null);

        try
        {

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {

                listObjs.Add(new
                {
                    AppID = Convert.ToInt32(dataReader["AppID"]),
                    Name = dataReader["Name"].ToString() ?? "",
                    numberOfPurchases = Convert.ToInt32(dataReader["numberOfPurchases"]),
                    totalAmountPaid = Convert.ToDouble(dataReader["totalAmountPaid"])
                });
            }
            return listObjs;
        }
        catch (Exception)
        {
            // write to log
            throw;
        }
        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }

    //---------------------------------------------------------------------------------
    // Create the SqlCommand
    //---------------------------------------------------------------------------------

    private SqlCommand CreateCommandWithStoredProcedureGeneral(String spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }

    //--------------------------------------------------------------------------------------------------
    // Delete game from the database method 
    //--------------------------------------------------------------------------------------------------
    public int DeleteById(GameUser gameUser)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@ID", gameUser.user.id);
        paramDic.Add("@AppID", gameUser.game.AppID);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteGame", con, paramDic);          // create the command

        try
        {
            // Execute the SP and get its return value
            cmd.Parameters.Add("@ReturnValue", SqlDbType.Int).Direction = ParameterDirection.ReturnValue;
            cmd.ExecuteNonQuery();
            int result = (int)cmd.Parameters["@ReturnValue"].Value;
            return result;  // Will return 1 or -1 from the SP
        }
        catch (Exception)
        {
            // write to log
            throw;
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }



}
