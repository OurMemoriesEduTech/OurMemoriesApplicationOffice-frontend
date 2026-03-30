import { coursesTUT } from '../../../coursesYouQualify/prospectus/tut.js'
import { coursesWITS } from '../../../coursesYouQualify/prospectus/wits.js';
import { coursesUJ } from '../../../coursesYouQualify/prospectus/uj.js';
import { coursesUNISA } from '../../../coursesYouQualify/prospectus/unisa.js';
import {coursesUP} from "../../../coursesYouQualify/prospectus/up.js";
import {coursesVUT} from "../../../coursesYouQualify/prospectus/vut.js";
import {coursesUMP} from "../../../coursesYouQualify/prospectus/ump.js";
import {coursesCPUT} from "../../../coursesYouQualify/prospectus/cput.js";
import {coursesCUT} from "../../../coursesYouQualify/prospectus/cut.js";
import {coursesDUT} from "../../../coursesYouQualify/prospectus/dut.js";
import {coursesMUT} from "../../../coursesYouQualify/prospectus/mut.js";
import {coursesNMU} from "../../../coursesYouQualify/prospectus/nmu.js";
import {coursesNWU} from "../../../coursesYouQualify/prospectus/nwu.js";
import {coursesRU} from "../../../coursesYouQualify/prospectus/ru.js";
import {coursesSMU} from "../../../coursesYouQualify/prospectus/smu.js";
import {coursesSPU} from "../../../coursesYouQualify/prospectus/spu.js";
import {coursesSUN} from "../../../coursesYouQualify/prospectus/sun.js";
import {coursesUCT} from "../../../coursesYouQualify/prospectus/uct.js";
import {coursesUKZN} from "../../../coursesYouQualify/prospectus/ukzn.js";
import {coursesUL} from "../../../coursesYouQualify/prospectus/ul.js";
import {coursesUNIVEN} from "../../../coursesYouQualify/prospectus/univen.js";
import {coursesUNIZULU} from "../../../coursesYouQualify/prospectus/unizulu.js";
import {coursesUWC} from "../../../coursesYouQualify/prospectus/uwc.js";
import {coursesWSU} from "../../../coursesYouQualify/prospectus/wsu.js";

// Combine all university arrays
export const universities =
    [...coursesTUT, ...coursesWITS, ...coursesUJ,
        ...coursesUNISA, ...coursesUP, ...coursesVUT,
        ...coursesUMP, ...coursesCPUT, ...coursesCUT,
        ...coursesDUT, ...coursesMUT, ...coursesNMU,
        ...coursesNWU, ...coursesRU, ...coursesSMU,
        ...coursesSPU, ...coursesSUN, ...coursesUCT,
        ...coursesUKZN, ...coursesUL, ...coursesUNIVEN,
        ...coursesUNIZULU, ...coursesUWC, ...coursesWSU];