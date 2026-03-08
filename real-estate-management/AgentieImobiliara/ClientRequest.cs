using AgentieImobiliara;
using System;
using System.DirectoryServices.ActiveDirectory;

namespace AgentieImobiliara
{
    public class ClientRequest
    {
        public int RequestId { get; set; }
        public int ClientId { get; set; }
        public PropertyType DesiredPropertyType { get; set; }
        public string DesiredLocation { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public double MinArea { get; set; }
        public int MinBedrooms { get; set; }
        public DateTime RequestDate { get; set; }
        public RequestStatus Status { get; set; } // folosesc enum

        public ClientRequest()
        {
            RequestDate = DateTime.Now;
            Status = RequestStatus.Active; // statusul initial al cererii este activ
        }

        public override string ToString()
        {
            return $"Request {RequestId} ({Status})";
        }
    }
}