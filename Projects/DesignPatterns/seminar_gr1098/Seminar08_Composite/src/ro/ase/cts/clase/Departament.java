package ro.ase.cts.clase;

import java.util.ArrayList;
import java.util.List;

//composite-ul
public class Departament implements Structura{
    private String numeDepartament;
    private List<Structura> subStructuri;

    public Departament(String numeDepartament) {
        this.numeDepartament = numeDepartament;
        this.subStructuri = new ArrayList<>();
    }

    public void adaugaStructura(Structura structura){
        subStructuri.add(structura);
    }

    public void stergeStructura(Structura structura){
        subStructuri.remove(structura);
    }

    public String getStructura(int index){
        return subStructuri.get(index).toString();
    }

    @Override
    public void afiseazaDetaliiStructura(String spatii) {
        System.out.println(spatii + "Nume departament " + this.numeDepartament);
        for(Structura structura : subStructuri){
            structura.afiseazaDetaliiStructura(spatii + "   ");
        }
    }
}
