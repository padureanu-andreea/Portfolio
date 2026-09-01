using AgentieImobiliara;
using System;

namespace AgentieImobiliara
{
    public class Offer
    {
        public int OfferId { get; set; }
        public int PropertyId { get; set; }
        public int ClientId { get; set; }
        public decimal OfferAmount { get; set; }
        public DateTime OfferDate { get; set; }
        public OfferStatus Status { get; set; }

        public Offer()
        {
            OfferDate = DateTime.Now;
            Status = OfferStatus.Pending; 
        }
        public override string ToString()
        {
            return $"Offer {OfferAmount:C} on {PropertyId} ({Status})";
        }
    }
}