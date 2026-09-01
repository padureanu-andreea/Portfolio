using System;

namespace AgentieImobiliara
{
    public class Agent
    {
        public int AgentId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime HireDate { get; set; }

        public Agent()
        {
            HireDate = DateTime.Now;
        }

        public override string ToString()
        {
            return $"Agent: {FirstName} {LastName}";
        }
    }
}