package ro.ase.cts.clase;

public class AutobuzDeNoapteProxy implements MijlocDeTransport{
    private MijlocDeTransport mijlocDeTransport;

    public AutobuzDeNoapteProxy(MijlocDeTransport mijlocDeTransport) {
        this.mijlocDeTransport = mijlocDeTransport;
    }

    @Override
    public void opresteInStatie(Statie statie) {
        if(statie.getNrCalatori() > 0 || this.mijlocDeTransport.getNrPasageri() > 0){
            this.mijlocDeTransport.opresteInStatie(statie);
        } else{
            System.out.println("Autobuzul nu opreste in statia " + statie.getNume());
        }
    }

    @Override
    public int getNrPasageri() {
        return this.mijlocDeTransport.getNrPasageri();
    }

    @Override
    public TipCursa getTipCursa() {
        return this.mijlocDeTransport.getTipCursa();
    }
}
