import {createFileRoute} from "@tanstack/react-router";
import {useEffect,useState} from "react";
import {BadgeCheck,Users} from "lucide-react";
import {toast} from "sonner";
import {PortalLayout,Panel,Stat} from "@/components/clina/PortalLayout";
import {RequireAuth} from "@/components/clina/RequireAuth";
import {listPendingProfessionals,reviewProfessional} from "@/lib/clina-data";
import type {PendingProfessional} from "@/lib/clina-types";
import {Button} from "@/components/ui/button";
export const Route=createFileRoute("/admin")({head:()=>({meta:[{title:"Super Painel — CLINA"}]}),component:Admin});
function Admin(){const[tab,setTab]=useState("valid"),[queue,setQueue]=useState<PendingProfessional[]>([]),[loading,setLoading]=useState(true);
 async function reload(){setLoading(true);try{setQueue(await listPendingProfessionals())}catch(e){toast.error(e instanceof Error?e.message:"Falha ao carregar fila de validação.")}finally{setLoading(false)}}
 useEffect(()=>{void reload()},[]);
 async function decide(id:string,approved:boolean){try{await reviewProfessional(id,approved,approved?undefined:"Documentação não validada. Entre em contato para regularização.");toast.success(approved?"Profissional aprovado.":"Cadastro recusado.");await reload()}catch(e){toast.error(e instanceof Error?e.message:"Não foi possível atualizar o cadastro.")}}
 const nav=[{key:"valid",label:"Validação CRP/CRM",icon:BadgeCheck},{key:"users",label:"Fila de cadastros",icon:Users}];
 return <RequireAuth allowedRoles={["admin"]}><PortalLayout title="Super Painel" role="Administração CLINA" nav={nav} active={tab} onChange={setTab}><div className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><Stat label="Cadastros pendentes" value={String(queue.length)}/><Stat label="Acesso a prontuários" value="Bloqueado"/></div><Panel title="Validação profissional">{loading?"Carregando fila…":queue.length?queue.map(p=><div key={p.user_id} className="flex flex-wrap items-center justify-between gap-4 border-b py-4 last:border-0"><div><p className="font-semibold">{p.public_name}</p><p className="text-sm text-muted-foreground">{p.category} · {p.registration_type} {p.registration_number}</p><p className="mt-1 text-xs text-muted-foreground">Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")}</p></div><div className="flex gap-2"><Button size="sm" onClick={()=>void decide(p.user_id,true)}>Aprovar</Button><Button size="sm" variant="destructive" onClick={()=>void decide(p.user_id,false)}>Reprovar</Button></div></div>):<p className="text-sm text-muted-foreground">Não há cadastros pendentes para validação.</p>}</Panel><p className="text-xs text-muted-foreground">Este painel não possui consultas nem permissões para acessar prontuários ou diário emocional. Métricas financeiras e auditoria só serão exibidas quando houver dados reais e serviços administrativos específicos.</p></div></PortalLayout></RequireAuth>;
}
