package ro.ase.cts.clase;

public class AutobuzCursaSpecialaProxy implements MijlocDeTransport{
    private MijlocDeTransport mijlocDeTransport;

    public AutobuzCursaSpecialaProxy(MijlocDeTransport mijlocDeTransport) {
        this.mijlocDeTransport = mijlocDeTransport;
    }

    @Override
    public void opresteInStatie(Statie statie) {
        if(this.mijlocDeTransport.getTipCursa() == TipCursa.CURSA_SPECIALA){
            System.out.println("Autobuzul nu opreste deloc - e in cursa speciala");
        } else{
            this.mijlocDeTransport.opresteInStatie(statie);
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
