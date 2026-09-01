package ro.ase.cts.clase;

import java.util.ArrayList;
import java.util.List;

public class CasaDeMarcat implements ComandaManager{
    private List<IBautura> bauturiComanda;
    private static CasaDeMarcat casaDeMarcat = null;

    private CasaDeMarcat() {
        bauturiComanda = new ArrayList<>();
    }

    public static synchronized CasaDeMarcat getInstance(){
        if(casaDeMarcat == null){
            casaDeMarcat = new CasaDeMarcat();
        }
        return casaDeMarcat;
    }

    @Override
    public void adaugaBautura(IBautura bautura) {
        bauturiComanda.add(bautura);
    }

    @Override
    public void afiseazaComanda() {
        System.out.println("Comanda contine:");
        for(IBautura bautura : bauturiComanda){
            System.out.println(bautura.getDetalii());
        }
    }

    @Override
    public double calculeazaPretComanda() {
        double pretTotal = 0;
        for(IBautura bautura : bauturiComanda){
            pretTotal += bautura.getPret();
        }
        return pretTotal;
    }

    @Override
    public void reseteazaComanda() {
        bauturiComanda.clear();
    }
}
