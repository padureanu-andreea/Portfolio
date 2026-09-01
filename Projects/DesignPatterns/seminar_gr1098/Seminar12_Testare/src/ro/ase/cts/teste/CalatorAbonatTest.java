package ro.ase.cts.teste;

import org.junit.Assert;
import ro.ase.cts.clase.CalatorAbonat;

public class CalatorAbonatTest {

    @org.junit.Test
    public void testPlatesteBilet() {
        CalatorAbonat calatorAbonat = new CalatorAbonat("Mihaita");
        calatorAbonat.setSold(5.5f);
        calatorAbonat.platesteBilet(1f);

        //se face o asertie ca sa verificam daca a mers
        Assert.assertEquals(4.5f, calatorAbonat.getSold(), 0.001f);
    }

    @org.junit.Test
    public void testPlatesteBiletInsuficient() {
        CalatorAbonat calatorAbonat = new CalatorAbonat("Adita");
        calatorAbonat.setSold(5.5f);
        calatorAbonat.platesteBilet(10f);

        Assert.assertEquals(5.5f, calatorAbonat.getSold(), 0.001f);
    }
}