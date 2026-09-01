package ro.ase.cts.clase;

import java.util.HashMap;
import java.util.Map;

public class BauturaPresetata {
    private Map<String, IBauturaPrototype> bauturiPresetate = new HashMap<>();

    public void adaugaBauturaPresetata(String key, IBauturaPrototype bautura){
        bauturiPresetate.put(key, bautura);
    }

    public IBauturaPrototype getBauturaPresetata(String key){
        if(bauturiPresetate.containsKey(key)){
            return bauturiPresetate.get(key).clone();
        } else return null;
    }
}
