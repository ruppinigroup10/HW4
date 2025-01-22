using Microsoft.AspNetCore.Mvc;
using Server_HW4.Models;

namespace Server_HW4.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {

        // GET: api/<UsersController>
        // [HttpGet]
        // public IEnumerable<User> Get()
        // {
        //     return Server.Models.User.readUser();
        // }

        // GET api/<UsersController>/5 
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // GET: api/<UsersController> getUserData
        [HttpGet("getUserData")]
        public IActionResult getUserData()
        {
            try
            {
                var usersData = new User().getUsersData();
                return Ok(usersData);
            }
            catch (Exception ex)
            {
                //error handling
                return StatusCode(500, ex.Message);
            }
        }

        //Post api/<UsersController>/Register
        [HttpPost("Register")]
        public IActionResult Register([FromBody] Server_HW4.Models.User user)
        {
            try
            {
                var newUser = Server_HW4.Models.User.Register(user.name, user.email, user.password);

                if (newUser != null)
                {
                    return Ok(new
                    {
                        message = "Registration successful",
                        user = newUser
                    });
                }
                return BadRequest(new { message = "Registration failed" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Email already exists"))
                {
                    return BadRequest(new { message = "Email already exists" });
                }
                return BadRequest(new { message = "Registration failed" });
            }
        }

        //Post api/<UsersController>/Login
        [HttpPost("Login")]
        public IActionResult Login([FromBody] User user)
        {
            try
            {
                var loggedInUser = Server_HW4.Models.User.Login(user.email, user.password);

                if (loggedInUser != null)
                {
                    return Ok(new
                    {
                        message = "Login successful",
                        user = new
                        {
                            id = loggedInUser.id,
                            name = loggedInUser.name,
                            email = loggedInUser.email,
                            isActive = loggedInUser.IsActive
                        }
                    });
                }
                return BadRequest(new { message = "Invalid email or password" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Account is not active"))
                {
                    return BadRequest(new { message = "Account is not active" });
                }
                return BadRequest(new { message = "Login failed" });
            }
        }

        //Put api/<UsersController>/UpdateProfile
        [HttpPut("UpdateProfile")]
        public IActionResult UpdateProfile([FromBody] Server_HW4.Models.User user)
        {
            try
            {
                var updatedUser = Server_HW4.Models.User.UpdateProfile(user.id, user.name, user.email, user.password);

                if (updatedUser != null)
                {
                    return Ok(new
                    {
                        message = "Profile updated successfully",
                        user = updatedUser
                    });
                }
                return BadRequest(new { message = "Update failed" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Email already exists"))
                {
                    return BadRequest(new { message = "Email already exists" });
                }
                return BadRequest(new { message = "Update failed" });
            }
        }

        //Put api/<UsersController>/UpdateProfile
        [HttpPut("IsActiveChange")]
        public IActionResult IsActiveChange(int id, int isActive)
        {
            try
            {
                User user = new User();
                user.updateIsActive(id, isActive);
                return Ok(new { message = "Updated successfully" });
            }
            catch (Exception)
            {
                return BadRequest(new { message = "Update failed" });
            }
        }


        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}