import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { getRecruitmentStatistics } from "../services/statisticsService";

const chartColors = [
  "#2563eb",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

const formatPercent = (value) => `${Number(value || 0)}%`;
const chartWidth = 520;
const compactLegendStyle = {
  fontSize: "11px",
  lineHeight: "16px",
};

const getShortLabel = (label, maxLength = 22) => {
  if (!label || label.length <= maxLength) {
    return label || "-";
  }

  return `${label.slice(0, maxLength - 3)}...`;
};

function KpiCard({ label, value, hint }) {
  return (
    <article className="stats-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </article>
  );
}

function ChartCard({ title, description, height = 320, children }) {
  return (
    <section className="stats-chart-card">
      <div className="chart-card-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      <div className="chart-wrapper" style={{ height }}>
        {children}
      </div>
    </section>
  );
}

function StatisticsPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const canAccess =
    user?.rol === "ADMIN" ||
    user?.rol === "RECRUTOR" ||
    user?.rol === "MANAGER";

  const isAdmin = user?.rol === "ADMIN";

  useEffect(() => {
    const loadStatistics = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getRecruitmentStatistics();
        setStatistics(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Nu s-au putut incarca statisticile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (canAccess) {
      loadStatistics();
    }
  }, [canAccess]);

  const applicationsByJob = useMemo(
    () =>
      (statistics?.applicationsByJob || []).map((item) => ({
        ...item,
        shortName: getShortLabel(item.name),
      })),
    [statistics]
  );

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <h1>Statistici</h1>
        <p>Se incarca statisticile...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <h1>Statistici</h1>
        <p className="error">{error}</p>
      </section>
    );
  }

  const summary = statistics?.summary || {};
  const adminSummary = statistics?.adminSummary || {};

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>{isAdmin ? "Statistici companie" : "Statistici recrutare"}</h1>
          <p>
            {isAdmin
              ? "Monitorizeaza activitatea generala a companiei si distributia procesului de recrutare pe departamente."
              : "Analizeaza rapid volumul de candidaturi, interviurile si eficienta procesului de recrutare."}
          </p>
        </div>
      </div>

      <div className="stats-kpi-grid">
        {isAdmin && (
          <>
            <KpiCard
              label="Departamente"
              value={adminSummary.departments || 0}
              hint="structura companiei"
            />
            <KpiCard
              label="Recrutori"
              value={adminSummary.recruiter_users || 0}
              hint="conturi companie"
            />
            <KpiCard
              label="Manageri"
              value={adminSummary.manager_users || 0}
              hint="conturi companie"
            />
            <KpiCard
              label="Candidati"
              value={adminSummary.candidate_users || 0}
              hint="conturi create"
            />
          </>
        )}

        <KpiCard
          label="Joburi active"
          value={summary.activeJobs || 0}
          hint={`${summary.totalJobs || 0} joburi in total`}
        />
        <KpiCard
          label="Candidaturi"
          value={summary.totalApplications || 0}
          hint={`${summary.inReviewApplications || 0} in analiza`}
        />
        <KpiCard
          label="Interviuri"
          value={summary.totalInterviews || 0}
          hint={`${summary.scheduledInterviews || 0} programate`}
        />
        <KpiCard
          label="Acceptari"
          value={summary.acceptedApplications || 0}
          hint={`${summary.rejectedApplications || 0} respinse`}
        />
        <KpiCard
          label="Conversie aplicari-interviuri"
          value={formatPercent(summary.applicationToInterviewRate)}
          hint="din total candidaturi"
        />
        <KpiCard
          label="Conversie interviuri-acceptari"
          value={formatPercent(summary.interviewToAcceptedRate)}
          hint="din total interviuri"
        />
        <KpiCard
          label="Scor mediu"
          value={Number(summary.averageScore || 0).toFixed(2)}
          hint={`${summary.unscoredApplications || 0} fara scor`}
        />
      </div>

      <div className="stats-chart-grid">
        <ChartCard
          title="Pipeline recrutare"
          description="Arata trecerea candidatilor prin etapele principale."
        >
          <BarChart
            width={chartWidth}
            height={300}
            data={statistics?.pipeline || []}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Numar candidati" fill="#2563eb" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Status candidaturi"
          description="Evidentiaza candidaturile active, finalizate sau retrase."
        >
          <PieChart width={chartWidth} height={300}>
            <Pie
              data={statistics?.applicationsByStatus || []}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="45%"
              outerRadius={95}
              label
            >
              {(statistics?.applicationsByStatus || []).map((entry, index) => (
                <Cell
                  key={entry.status}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              wrapperStyle={compactLegendStyle}
              iconSize={8}
              layout="horizontal"
            />
          </PieChart>
        </ChartCard>

        <ChartCard
          title={isAdmin ? "Aplicari pe job" : "Aplicari pe joburile tale"}
          description="Ajuta la identificarea joburilor care atrag cei mai multi candidati."
          height={340}
        >
          <BarChart width={chartWidth} height={320} data={applicationsByJob}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortName" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Aplicari" fill="#0ea5e9" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Status interviuri"
          description="Arata interviurile programate, finalizate, anulate sau reprogramate."
          height={340}
        >
          <BarChart
            width={chartWidth}
            height={320}
            data={statistics?.interviewsByStatus || []}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Interviuri" fill="#16a34a" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Distributia scorurilor"
          description="Arata calitatea generala a potrivirii candidatilor analizati."
        >
          <BarChart
            width={chartWidth}
            height={300}
            data={statistics?.scoreDistribution || []}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Candidaturi" fill="#8b5cf6" />
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Status joburi"
          description="Ofera o imagine rapida asupra joburilor draft, active si inchise."
        >
          <PieChart width={chartWidth} height={300}>
            <Pie
              data={statistics?.jobsByStatus || []}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="45%"
              outerRadius={95}
              label
            >
              {(statistics?.jobsByStatus || []).map((entry, index) => (
                <Cell
                  key={entry.status}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              wrapperStyle={compactLegendStyle}
              iconSize={8}
              layout="horizontal"
            />
          </PieChart>
        </ChartCard>

        {isAdmin && (
          <ChartCard
            title="Activitate pe departamente"
            description="Compara volumul de joburi, aplicari si interviuri intre departamente."
            height={380}
          >
            <BarChart
              width={chartWidth}
              height={360}
              data={statistics?.departmentStats || []}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend
                wrapperStyle={compactLegendStyle}
                iconSize={8}
                layout="horizontal"
              />
              <Bar dataKey="jobs" name="Joburi" fill="#2563eb" />
              <Bar dataKey="applications" name="Aplicari" fill="#0ea5e9" />
              <Bar dataKey="interviews" name="Interviuri" fill="#16a34a" />
              <Bar dataKey="accepted" name="Acceptari" fill="#f59e0b" />
            </BarChart>
          </ChartCard>
        )}
      </div>
    </section>
  );
}

export default StatisticsPage;
