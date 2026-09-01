package ro.ase.cts.clase;

public class Autobuz implements MijlocDeTransport{
    private int nrPasageri;
    private int nrLinie;
    private TipCursa tipCursa;

    public Autobuz(int nrPasageri, int ntLinie) {
        this.nrPasageri = nrPasageri;
        this.nrLinie = ntLinie;
        this.tipCursa = TipCursa.CURSA_NORMALA;
    }

    public Autobuz(int nrPasageri, int nrLinie, TipCursa tipCursa) {
        this.nrPasageri = nrPasageri;
        this.nrLinie = nrLinie;
        this.tipCursa = tipCursa;
    }

    public int getNrPasageri() {
        return nrPasageri;
    }

    public TipCursa getTipCursa() {
        return tipCursa;
    }

    @Override
    public void opresteInStatie(Statie statie) {
        System.out.println("Autobuzul de pe linia " + this.nrLinie + " a oprit in statia " + statie.getNume());
    }
}
