package ro.ase.cts.clase;

public class Linie implements LinieDeTransport{
    private String primaStatie;
    private String ultimaStatie;
    private int nrLinie;

    //asemanare cu singleton registry
    protected Linie(String primaStatie, String ultimaStatie, int nrLinie) {
        this.primaStatie = primaStatie;
        this.ultimaStatie = ultimaStatie;
        this.nrLinie = nrLinie;
    }



    @Override
    public void descriereLinie(Autobuz autobuz) {
        System.out.println("Linia " + this.nrLinie + " pleaca din statia " +
                this.primaStatie + " si opreste in statia " + this.ultimaStatie +
                ". Pe aceasta linie circula autobuzul " + autobuz.toString());
    }

    @Override
    public void afiseazaNrMaximPasageriPeLinie(Autobuz autobuz) {
        System.out.println("Numarul maxim de calatori de pe lina " +
                this.nrLinie + " este de " + autobuz.getNrLocuri() + " locuri.");
    }
}
