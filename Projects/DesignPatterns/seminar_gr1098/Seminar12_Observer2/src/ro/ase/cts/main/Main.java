package ro.ase.cts.main;

import ro.ase.cts.clase.Autobuz;
import ro.ase.cts.clase.Calator;
import ro.ase.cts.clase.CalatorAbonat;
import ro.ase.cts.clase.MijlocTransport;

import javax.sound.midi.MidiChannel;

public class Main {
    public static void main(String[] args) {
        Calator calator = new CalatorAbonat("Mihaita");
        Calator calator1 = new CalatorAbonat("Gigel");
        Calator calator2 = new CalatorAbonat("Costel");
        Calator calator3 = new CalatorAbonat("Adita");

        MijlocTransport autobuz = new Autobuz("168");

        autobuz.abonare(calator);
        autobuz.abonare(calator1);
        autobuz.abonare(calator2);

        autobuz.pleacaDinDepou();

        autobuz.abonare(calator3);

        autobuz.blocatInTrafic();
    }
}
