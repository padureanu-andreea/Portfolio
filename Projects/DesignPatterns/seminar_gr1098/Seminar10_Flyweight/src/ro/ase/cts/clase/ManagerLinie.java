package ro.ase.cts.clase;

import java.util.HashMap;
import java.util.Map;

public class ManagerLinie {
    Map<Integer, Linie> registruLinii = new HashMap<Integer, Linie>();

    public Linie getLinie(int nrLinie, String primaStatie, String ultimaStatie){
        if(registruLinii.containsKey(nrLinie)){
            return registruLinii.get(nrLinie);
        } else {
            registruLinii.put(nrLinie, new Linie(primaStatie, ultimaStatie, nrLinie));
            return registruLinii.get(nrLinie);
        }
    }
}