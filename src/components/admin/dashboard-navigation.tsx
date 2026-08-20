"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Users,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";

import styles from "./page.module.css";

type DashboardTab = "ENCONTRISTAS" | "ENCONTREIROS" | "EVENTOS" | "EQUIPES";

type DashboardNavigationProps = {
  children?: React.ReactNode;
};

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    id: "ENCONTRISTAS",
    label: "Encontristas",
    description: "Inscrições, pais adotivos e convidados",
    icon: Users,
  },
  {
    id: "ENCONTREIROS",
    label: "Encontreiros",
    description: "Servos, responsáveis e acompanhamento",
    icon: UserRoundCheck,
  },
  {
    id: "EVENTOS",
    label: "Eventos",
    description: "Edições, períodos e financeiro",
    icon: CalendarDays,
  },
  {
    id: "EQUIPES",
    label: "Equipes",
    description: "Áreas, responsáveis e distribuição",
    icon: HeartHandshake,
  },
];

function SummaryCard({
  label,
  value,
  helper,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "green" | "yellow" | "red" | "blue";
  icon: typeof Users;
}) {
  return (
    <article className={`${styles.summaryCard} ${styles[`tone${tone}`]}`}>
      <div className={styles.summaryIcon}><Icon size={19} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.sectionTitle}>
      <div>
        <p className={styles.sectionEyebrow}>Resumo</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function EncontristasSummary() {
  return (
    <div className={styles.tabContent}>
      <SectionTitle title="Encontristas" description="Acompanhe inscrições, pais adotivos e convidados do encontro." />

      <div className={styles.summaryGrid}>
        <SummaryCard label="Inscrições" value="—" helper="Total de grupos inscritos" icon={ClipboardList} tone="blue" />
        <SummaryCard label="Convidados" value="—" helper="Pessoas cadastradas" icon={Users} tone="default" />
        <SummaryCard label="Pais adotivos" value="—" helper="Nomes únicos registrados" icon={HeartHandshake} tone="green" />
        <SummaryCard label="Pendências" value="—" helper="Cadastros para revisar" icon={AlertTriangle} tone="yellow" />
      </div>

      <div className={styles.analysisGrid}>
        <article className={styles.analysisCard}>
          <h3>Inscrições</h3>
          <p>Indicadores planejados para esta seção:</p>
          <ul><li>Total de inscrições.</li><li>Inscrições novas.</li><li>Inscrições completas.</li><li>Inscrições pendentes.</li><li>Inscrições por evento.</li><li>Total previsto em inscrições.</li></ul>
        </article>
        <article className={styles.analysisCard}>
          <h3>Pais adotivos</h3>
          <p>Informações para acompanhamento:</p>
          <ul><li>Total de nomes únicos.</li><li>Pais adotivos com mais de um convidado.</li><li>Convidados sem pai adotivo informado.</li><li>WhatsApps ausentes ou incompletos.</li><li>Distribuição por evento.</li></ul>
        </article>
        <article className={styles.analysisCard}>
          <h3>Convidados</h3>
          <p>Visão operacional dos participantes:</p>
          <ul><li>Total de convidados.</li><li>Perfis dos convidados.</li><li>Complementações concluídas.</li><li>Documentos pendentes.</li><li>Restrições alimentares.</li><li>Convidados por evento.</li></ul>
        </article>
      </div>

      <div className={styles.noticeGrid}>
        <article className={`${styles.noticeCard} ${styles.noticeWarning}`}><AlertTriangle size={19} /><div><strong>Avisos importantes</strong><p>Convidados sem dados completos, documentos ou informações dos pais adotivos aparecerão aqui.</p></div></article>
        <article className={`${styles.noticeCard} ${styles.noticeSuccess}`}><CheckCircle2 size={19} /><div><strong>Acompanhamento</strong><p>Use esta aba para identificar rapidamente o que precisa ser conferido antes do encontro.</p></div></article>
      </div>
    </div>
  );
}

function EncontreirosSummary() {
  return (
    <div className={styles.tabContent}>
      <SectionTitle title="Encontreiros" description="Acompanhe as pessoas que servem e ajudam na organização do encontro." />
      <div className={styles.summaryGrid}>
        <SummaryCard label="Encontreiros" value="—" helper="Total cadastrados" icon={UserRoundCheck} tone="blue" />
        <SummaryCard label="Ativos" value="—" helper="Disponíveis para servir" icon={CheckCircle2} tone="green" />
        <SummaryCard label="Com equipe" value="—" helper="Alocados em uma equipe" icon={HeartHandshake} tone="default" />
        <SummaryCard label="Sem equipe" value="—" helper="Precisam de distribuição" icon={AlertTriangle} tone="yellow" />
      </div>
      <div className={styles.analysisGrid}>
        <article className={styles.analysisCard}><h3>Distribuição</h3><p>Visualize a quantidade de encontreiros por evento e por função.</p><ul><li>Encontreiros por evento.</li><li>Responsáveis por área.</li><li>Disponibilidade.</li><li>Funções acumuladas.</li></ul></article>
        <article className={styles.analysisCard}><h3>Acompanhamento</h3><p>Identifique pessoas que precisam de atualização cadastral.</p><ul><li>Cadastros incompletos.</li><li>Contatos ausentes.</li><li>Encontreiros inativos.</li><li>Responsáveis sem substituto.</li></ul></article>
        <article className={styles.analysisCard}><h3>Alertas</h3><p>Área para avisos de escala e organização.</p><ul><li>Equipes incompletas.</li><li>Funções sem responsável.</li><li>Conflitos de escala.</li></ul></article>
      </div>
    </div>
  );
}

function EventosSummary({ children }: DashboardNavigationProps) {
  return (
    <div className={styles.tabContent}>
      <SectionTitle title="Eventos" description="Acompanhe edições, períodos, situação e financeiro dos encontros." />
      {children ?? <div className={styles.placeholder}>A tela de eventos atual permanecerá nesta aba.</div>}
    </div>
  );
}

function EquipesSummary() {
  return (
    <div className={styles.tabContent}>
      <SectionTitle title="Equipes" description="Visualize a composição das equipes e a distribuição de responsabilidades." />
      <div className={styles.summaryGrid}>
        <SummaryCard label="Equipes" value="—" helper="Total cadastradas" icon={HeartHandshake} tone="blue" />
        <SummaryCard label="Encontreiros alocados" value="—" helper="Com equipe definida" icon={Users} tone="green" />
        <SummaryCard label="Vagas abertas" value="—" helper="Necessitam de pessoas" icon={ClipboardList} tone="yellow" />
        <SummaryCard label="Alertas" value="—" helper="Equipes para revisar" icon={AlertTriangle} tone="red" />
      </div>
      <div className={styles.analysisGrid}>
        <article className={styles.analysisCard}><h3>Composição</h3><p>Confira quantas pessoas estão em cada equipe.</p><ul><li>Equipe e responsável.</li><li>Quantidade de integrantes.</li><li>Funções ocupadas.</li><li>Vagas disponíveis.</li></ul></article>
        <article className={styles.analysisCard}><h3>Distribuição</h3><p>Compare a quantidade de pessoas entre as áreas.</p><ul><li>Equipes maiores e menores.</li><li>Equipes sem responsável.</li><li>Encontreiros sem alocação.</li></ul></article>
        <article className={styles.analysisCard}><h3>Avisos</h3><p>Centralize situações que precisam da atenção da coordenação.</p><ul><li>Equipe incompleta.</li><li>Responsável ausente.</li><li>Conflito de função.</li></ul></article>
      </div>
    </div>
  );
}

export function DashboardNavigation({ children }: DashboardNavigationProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("EVENTOS");

  const activeTabData = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab]);

  return (
    <section className={styles.dashboardNavigation}>
      <nav className={styles.tabNav} aria-label="Resumos do sistema">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return <button className={active ? styles.tabActive : styles.tabButton} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button"><Icon size={18} /><span><strong>{tab.label}</strong><small>{tab.description}</small></span></button>;
        })}
      </nav>

      <div className={styles.activeTabLabel}><BarChart3 size={17} /><span>{activeTabData.description}</span></div>

      {activeTab === "ENCONTRISTAS" && <EncontristasSummary />}
      {activeTab === "ENCONTREIROS" && <EncontreirosSummary />}
      {activeTab === "EVENTOS" && <EventosSummary>{children}</EventosSummary>}
      {activeTab === "EQUIPES" && <EquipesSummary />}
    </section>
  );
}