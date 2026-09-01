package ro.ase.cts.clase;

public class Plecare implements Command{
    private Autobuz autobuz;
    private int nrLinie;

    public Plecare(Autobuz autobuz, int nrLinie) {
        this.autobuz = autobuz;
        this.nrLinie = nrLinie;
    }

    @Override
    public void pleacaInCursa() {
        autobuz.pleacaPeTraseu(this.nrLinie);
    }
}
