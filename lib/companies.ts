import companiesData from "@/data/companies.json";
import type { Company } from "./types";

export function getCompanies(): Company[] {
  return companiesData as Company[];
}

export function findCompanyById(companyId: string, source = getCompanies()): Company | undefined {
  return source.find((company) => company.id === companyId);
}