package ro.ase.cts.clase;

import java.util.Arrays;

public class Student extends Aplicant {
	protected String facultate;
	protected int an_studii;
	private static int VALOARE_FINANTARE_STUDENT=20;
	
	public String getFacultate() {
		return facultate;
	}
	public void setFacultate(String facultate) {
		this.facultate = facultate;
	}
	public int getAn_studii() {
		return an_studii;
	}
	public void setAn_studii(int an_studii) {
		this.an_studii = an_studii;
	}


	public Student() {
		super();
		
	}

	@Override
	public void afiseazaFinantare() {
		System.out.println("Studentul "+getNume()+" "+getPrenume()+" primeste"+VALOARE_FINANTARE_STUDENT+" Euro/zi in proiect.");
	}

	public Student(String nume, String prenume, int varsta, int punctaj, int nr_proiecte, String[] denumireProiect, String facultate, int an_studii) {
		super(nume,prenume,varsta,punctaj,nr_proiecte,denumireProiect);
		this.facultate = facultate;
		this.an_studii = an_studii;
	}

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("Student{");
		sb.append(super.toString());
		sb.append("facultate='").append(facultate).append('\'');
		sb.append(", an_studii=").append(an_studii);
		sb.append('}');
		return sb.toString();
	}
	//	public int finantare() {
//		int s=20;
//		System.out.println("Studentul "+getNume()+" "+getPrenume()+" primeste"+s+" Euro/zi in proiect.");
//		return s;
//	}

	public static void setValoareFinantare(int valoareFinantare) {
		VALOARE_FINANTARE_STUDENT = valoareFinantare;
	}
}
