package ro.ase.cts.main;

import java.io.FileNotFoundException;
import java.util.List;

import ro.ase.cts.clase.Angajat;
import ro.ase.cts.clase.Aplicant;
import ro.ase.cts.clase.readere.AngajatiReader;
import ro.ase.cts.clase.readere.AplicantReader;

public class Main {

	public static void main(String[] args) {
		Angajat.setValoareFinantare(50);
		List<Aplicant> listaAngajati;
		try {
			AplicantReader angajatiReader = new AngajatiReader("angajati.txt");
			listaAngajati = angajatiReader.readAplicanti();
			for(Aplicant angajat:listaAngajati) {
				System.out.println(angajat.toString());
				angajat.afiseazaFinantare();
				angajat.afiseazaStatut();
			}
			angajatiReader.readAplicanti();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
