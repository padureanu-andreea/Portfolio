package ro.ase.cts.clase;

public class Autobuz extends MijlocTransport{
    public Autobuz(String nrLinie) {
        super(nrLinie);
    }

    @Override
    public void pleacaDinDepou() {
        String mesaj = "Autobuzul de pe linia " + super.nrLinie + " pleaca din depou.";
        notificare(mesaj);
    }

    @Override
    public void blocatInTrafic() {
        String mesaj = "Autobuzul de pe linia " + super.nrLinie + " este blocat in trafic.";
        notificare(mesaj);
    }
}
