using System;

namespace AgentieImobiliara
{
    public class Client
    {
        public int ClientId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public ClientType Type { get; set; }

        public Client()
        {
        }

        public override string ToString()
        {
            return $"{FirstName} {LastName} ({Email})";
        }
    }
}