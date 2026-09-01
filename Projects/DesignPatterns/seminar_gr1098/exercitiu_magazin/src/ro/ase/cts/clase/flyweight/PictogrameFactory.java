package ro.ase.cts.clase.flyweight;

import java.util.HashMap;
import java.util.Map;

public class PictogrameFactory {
    Map<String, PictogramePersonalizareFlyweight> registruPictograme = new HashMap<>();

    public PictogramePersonalizareFlyweight getPictograma(String tipPersonalizare){
        if(registruPictograme.containsKey(tipPersonalizare)){
            return registruPictograme.get(tipPersonalizare);
        }
        else {
            registruPictograme.put(tipPersonalizare, new PictogramePersonalizareFlyweight(tipPersonalizare));
            return registruPictograme.get(tipPersonalizare);
        }
    }
}
