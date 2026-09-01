using System;

namespace AgentieImobiliara
{
    public enum PropertyType
    {
        House,
        Apartment,
        Condo,
        Land,
        Commercial
    }

    public enum PropertyStatus
    {
        ForSale,
        ForRent,
        Sold,
        Rented,
        Unavailable
    }

    public enum OfferStatus
    {
        Pending,
        Accepted,
        Rejected,
        Withdrawn
    }

    public enum RequestStatus
    {
        Active,
        Fulfilled,
        Cancelled
    }

    public enum ClientType
    {
        Buyer,
        Renter,
        Invester
    }

}