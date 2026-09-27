"use client";

import { useState } from "react";

const departments = [
  "CSE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "AI&DS"
];

export default function StudentForm({ refresh }: any) {

  const [form, setForm] = useState({
    collegeId:"",
    registerNo:"",
    name:"",
    dob:"",
    department:"CSE",
    year:"1",
    semester:"1",
    section:"A"
  });

  async function save(e:any){
    e.preventDefault();

    await fetch("/api/students",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(form)
    });

    refresh();

    setForm({
      collegeId:"",
      registerNo:"",
      name:"",
      dob:"",
      department:"CSE",
      year:"1",
      semester:"1",
      section:"A"
    });
  }

  return(
    <form
      onSubmit={save}
      className="grid md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow"
    >

      <input
        placeholder="College ID"
        className="border p-3 rounded-lg"
        value={form.collegeId}
        onChange={(e)=>setForm({...form,collegeId:e.target.value})}
      />

      <input
        placeholder="Register Number"
        className="border p-3 rounded-lg"
        value={form.registerNo}
        onChange={(e)=>setForm({...form,registerNo:e.target.value})}
      />

      <input
        placeholder="Student Name"
        className="border p-3 rounded-lg"
        value={form.name}
        onChange={(e)=>setForm({...form,name:e.target.value})}
      />

      <input
        type="date"
        className="border p-3 rounded-lg"
        value={form.dob}
        onChange={(e)=>setForm({...form,dob:e.target.value})}
      />

      <select
        className="border p-3 rounded-lg"
        value={form.department}
        onChange={(e)=>setForm({...form,department:e.target.value})}
      >
        {departments.map((d)=>(
          <option key={d}>{d}</option>
        ))}
      </select>

      <select
        className="border p-3 rounded-lg"
        value={form.year}
        onChange={(e)=>setForm({...form,year:e.target.value})}
      >
        {[1,2,3,4].map((y)=>(
          <option key={y}>{y}</option>
        ))}
      </select>

      <select
        className="border p-3 rounded-lg"
        value={form.semester}
        onChange={(e)=>setForm({...form,semester:e.target.value})}
      >
        {[1,2,3,4,5,6,7,8].map((s)=>(
          <option key={s}>{s}</option>
        ))}
      </select>

      <select
        className="border p-3 rounded-lg"
        value={form.section}
        onChange={(e)=>setForm({...form,section:e.target.value})}
      >
        {["A","B","C"].map((sec)=>(
          <option key={sec}>{sec}</option>
        ))}
      </select>

      <button className="bg-blue-700 text-white rounded-lg py-3 col-span-full">
        Add Student
      </button>

    </form>
  )
}