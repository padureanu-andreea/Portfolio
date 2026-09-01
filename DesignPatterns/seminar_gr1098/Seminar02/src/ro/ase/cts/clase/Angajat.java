package ro.ase.cts.clase;

import java.util.Arrays;

public class Angajat extends Aplicant{
	private String ocupatie;
	private int salariu;
	private static int VALOARE_FINANTARE_ANGAJAT=10;
	
	public String getOcupatie() {
		return ocupatie;
	}
	public void setOcupatie(String ocupatie) {
		this.ocupatie = ocupatie;
	}
	public int getSalariu() {
		return salariu;
	}
	public void setSalariu(int salariu) {
		this.salariu = salariu;
	}
	public Angajat(String nume, String prenume, int varsta, int punctaj, int nr_proiecte, String[] denumire_Proiecte,int salariu,String ocupatie) {
		super(nume,prenume,varsta,punctaj,nr_proiecte,denumire_Proiecte);
		this.salariu = salariu;
		this.ocupatie = ocupatie;
	}
	public Angajat() {
		super();
		
	}

	@Override
	public void afiseazaFinantare() {
		System.out.println("Angajatul "+getNume()+" "+getPrenume()+" primeste"+VALOARE_FINANTARE_ANGAJAT+" Euro/zi in proiect.");

	}


	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("Angajat{");
		sb.append(super.toString());
		sb.append("ocupatie='").append(ocupatie).append('\'');
		sb.append(", salariu=").append(salariu);
		sb.append('}');
		return sb.toString();
	}
	//	public int finantare() {
//		int s=10;
//		// TODO Auto-generated method stub
//		System.out.println("Angajatul "+getNume()+" "+getPrenume()+" primeste"+s+" Euro/zi in proiect.");
//		return s;
//	}

	public static void setValoareFinantare(int valoareFinantare) {
		VALOARE_FINANTARE_ANGAJAT = valoareFinantare;
	}
}
