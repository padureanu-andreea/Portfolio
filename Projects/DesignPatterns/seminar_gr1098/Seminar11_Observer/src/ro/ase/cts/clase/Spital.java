package ro.ase.cts.clase;

import java.util.ArrayList;
import java.util.List;

public class Spital implements ISpital{
    private String nume;
    private List<Pacient> listaPacienti = new ArrayList<>();

    public Spital(String nume) {
        this.nume = nume;
    }

    @Override
    public void trimiteMesaj(String mesaj) {
        for(Pacient pacient : listaPacienti){
            pacient.receptioneazaNotificare(mesaj + " de la spitalul " + this.nume);
        }
    }

    @Override
    public void aboneazaPacient(Pacient pacient) {
        listaPacienti.add(pacient);
    }

    @Override
    public void dezaboneazaPacient(Pacient pacient) {
        listaPacienti.remove(pacient);
    }

    public void notificareVirus(){
        trimiteMesaj("Atentie virus nou!");
    }

    public void notificareEpidemie(){
        trimiteMesaj("Atentie epidemie!");
    }
}
