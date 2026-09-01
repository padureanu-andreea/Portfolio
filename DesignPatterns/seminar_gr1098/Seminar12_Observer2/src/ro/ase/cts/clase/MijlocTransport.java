package ro.ase.cts.clase;

import java.util.ArrayList;
import java.util.List;

public abstract class MijlocTransport {
    private List<Calator> listaCalatori;
    protected String nrLinie;

    public MijlocTransport(String nrLinie) {
        this.nrLinie = nrLinie;
        this.listaCalatori = new ArrayList<>();
    }

    public void abonare(Calator calator){
        listaCalatori.add(calator);
    }

    public void dezabonare(Calator calator){
            listaCalatori.remove(calator);
    }

    void notificare(String mesaj){
        for(Calator calator : this.listaCalatori){
            calator.notificare(this.nrLinie + " " + mesaj);
        }
    }

    public abstract void pleacaDinDepou();
    public abstract void blocatInTrafic();
}
