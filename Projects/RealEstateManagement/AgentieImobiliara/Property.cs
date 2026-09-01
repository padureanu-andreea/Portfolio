using AgentieImobiliara;
using System;
using System.DirectoryServices.ActiveDirectory;

namespace AgentieImobiliara
{
    public class Property
    {
        public int PropertyId { get; set; } 
        public string Address { get; set; }
        public PropertyType Type { get; set; } 
        public PropertyStatus Status { get; set; } 
        public decimal Price { get; set; }
        public double Area { get; set; } 
        public int NumberOfBedrooms { get; set; }
        public int NumberOfBathrooms { get; set; }
        public string Description { get; set; }
        public DateTime ListingDate { get; set; }
        public int AgentId { get; set; }
        public int OwnerClientId { get; set; }

        public Property()
        {
            ListingDate = DateTime.Now;
        }

        public override string ToString()
        {
            return $"{Type} at {Address} ({Status})";
        }
    }
}